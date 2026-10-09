# PRISMA Project Audit

**Repository:** `/Users/wendy/Projects/prisma_copy` (remote: `https://github.com/LunarPandora/Prisma.git`, branch `main`)
**Audit date:** 2026-10-09
**Audit type:** Read-only technical and documentary audit for institutional handover
**Scope:** Monorepo — `prisma/` (Next.js frontend), `prisma-server/` (Laravel backend), root-level thesis/verification documentation

---

## 1. Executive Summary

PRISMA is a research-grant management system ("Sistem Manajemen Penelitian") for an LPPM institution, implementing a multi-role workflow for research proposals (`Proposal`), assignment of reviewers, dissemination reports (`Laporan Diseminasi`), budgets (`Dana`), logbooks, notifications, and document generation. The system is **functionally mature and verified by an automated E2E test suite**, but carries **significant handover risks** in its current working-tree state.

**Headline findings:**

- **Maturity:** Backend (Laravel 12) has 35 controllers, 31 Eloquent models, 88 migrations, and 186 route definitions (131+ API endpoints, all inside a single `auth:sanctum` group at `prisma-server/routes/api.php:42`, with `role:` middleware on role-gated routes). Frontend is a Next.js 16 App Router SPA shell (`prisma/src/app/dashboard/`) serving 6 role dashboards through a `?module=` query-param router.
- **Verification:** An automated Playwright suite lists **364 tests across 79 spec files** (`npx playwright test --list`), covering Dosen, Staff LPPM, Ketua LPPM, Reviewer, Superadmin, shared-guest, and screenshots projects. The most recent full regression run (all projects except `screenshots`) passed **339/339**.
- **Critical handover risk:** The git working tree contains **549 uncommitted changes** (177 modified + 372 untracked files against 603 tracked files). The committed state does **not** reflect the verified state. This is the single most urgent item before any handover.
- **Workflow design:** Proposal Seleksi follows a **Staff-then-Ketua** ordering: Dosen submits → Staff LPPM review → Ketua LPPM decision → Staff assigns 3 reviewers → review → Ketua approval → `Proposal Diterima`.
- **Security posture:** All API routes require Sanctum authentication; role checks are enforced server-side via `role:` middleware (`prisma-server/app/Http/Middleware/CheckRole.php`). However, `docs/sus-testing-accounts.md` contains **plaintext test credentials** in the repository, and `.env` files (with live-looking configuration) are present alongside `.env.example`.
- **Deployment readiness:** **No CI/CD** (`.github/workflows` absent), **no Dockerfile / docker-compose**, and no documented production deployment runbook beyond `PRISMA_DEPLOYMENT_CONFIGURATION.md`.

**Overall classification:** *Implemented and locally verified; not yet release-hardened.* The system is demonstrably working end-to-end in a controlled testing environment, but requires a commit freeze, secret hygiene pass, and deployment pipeline before institutional handover.

---

## 2. Repository & Architecture Overview

```
prisma_copy/
├── prisma/                  # Next.js 16 frontend (App Router)
│   ├── src/app/dashboard/   # SPA shell + role pages (Admin, Dosen, Ketua, Reviewer, Home, Notification)
│   ├── src/app/component/   # UI components, menu.js router
│   ├── src/app/stores/      # zustand: useUserStore, useNotificationStore, useLoaderStore
│   ├── tests/e2e/           # 74 Playwright spec files by role
│   └── playwright.config.ts # 12 projects (auth setups + 6 test projects + screenshots)
├── prisma-server/           # Laravel 12 backend
│   ├── routes/api.php       # 186 Route:: definitions, single auth:sanctum group
│   ├── routes/web.php       # 3 public routes (login, logout, file serving)
│   ├── app/Http/Controllers # 35 controllers (incl. Proposal/ subnamespace)
│   ├── app/Models           # 31 models
│   ├── app/Services         # 7 services (documents, avatars, notifications, Scholar)
│   ├── database/migrations  # 88 migrations
│   └── database/seeders     # 21 seeders (E2E* + SUS* + screenshot)
├── docs/sus-testing-accounts.md   # Plaintext test credentials
└── *.md                     # 8 root-level thesis/verification documents (~400 KB total)
```

**Architecture pattern:** The frontend is a client-side SPA — there is **no Next.js middleware and no API route handlers**; every data call goes from the browser to the Laravel API with Sanctum cookie/session auth. Role selection is driven by `prisma/src/app/component/Libraries/utils/menu.js`, which maps module keys to page components rendered inside `/dashboard?module=...`.

---

## 3. Technology Stack

| Layer | Technology | Evidence |
|---|---|---|
| Frontend framework | Next.js 16.1.6, React 19.2.3, React Compiler (Babel plugin) | `prisma/package.json` |
| Styling | Tailwind CSS v4 + typography plugin | `prisma/package.json` devDependencies |
| State | zustand 5.0.11 (3 stores) | `prisma/src/app/stores/` |
| UI/data libs | FontAwesome 7, framer-motion 12, recharts 3, quill/react-quill-new 2, pdfjs-dist 5, react-day-picker 9 | `prisma/package.json` |
| Backend | Laravel 12, PHP ^8.2 | `prisma-server/composer.json` |
| Auth | Laravel Sanctum 4 (`statefulApi()` enabled) | `prisma-server/bootstrap/app.php:15` |
| Documents | PhpOffice/PhpWord 1.4 (DOCX generation) | `composer.json` + `app/Services/*DocxService.php` |
| Images | Intervention Image 4 (avatars) | `composer.json` + `app/Services/AvatarService.php` |
| Database | MySQL/MariaDB (default), DB-backed queue, cache, session | `prisma-server/config/*`, `.env` keys (names only) |
| Search integration | SerpApi (Google Scholar profile sync) | `app/Services/Scholar/SerpApiProvider.php`, `config/services.php:39` |
| Backend testing | Pest 3 (+ Laravel plugin) | `composer.json` require-dev |
| E2E testing | Playwright 1.62.1 | `prisma/package.json` devDependencies |
| HTTP client (frontend) | axios 1.13.6 | `prisma/package.json` |

**Notable absences:** no Docker, no CI configuration, no TypeScript (frontend is plain JS/JSX — 179 source files), no API schema (OpenAPI/Swagger) artifact.

---

## 4. Role & Access Model

Six roles exist as string values on the `users` table (there is no roles/permissions table — access is hardcoded per-route):

| Role | Server enforcement | Frontend dashboard |
|---|---|---|
| `Superadmin` | `role:Superadmin` middleware groups in `routes/api.php` | `dashboard/pages/Admin/` |
| `Staff LPPM` | `role:Staff LPPM` | `dashboard/pages/` (Staff views) |
| `Ketua LPPM` | `role:Ketua LPPM` | `dashboard/pages/Ketua/` |
| `Dosen` | `role:Dosen` | `dashboard/pages/Dosen/` |
| `Reviewer` | `role:Reviewer` | `dashboard/pages/Reviewer/` |
| `Rektorat` | Partial — legacy endpoint only | **No dedicated pages found** |

Evidence:
- Role middleware: `prisma-server/app/Http/Middleware/CheckRole.php:32` (checks `$user->role` against an allow-list).
- Middleware alias registered: `prisma-server/bootstrap/app.php:20`.
- Role-gated dashboard endpoints: `prisma-server/routes/api.php:50-54`.
- Rektorat status: `prisma-server/app/Http/Controllers/SettingsController.php:204-210` is explicitly labelled *"legacy, kept for compatibility"*; `prisma/src/app/component/Libraries/utils/menu.js:27` lists Rektorat only as a comment under "Available Roles". **Classification: Planned-Stub / legacy residue.**

**Handover note:** Frontend role gating is present in `menu.js` but the authoritative enforcement is server-side; UI hiding must not be treated as access control.

---

## 5. Feature Inventory & Implementation Status

Status legend: **Implemented** (working + covered by passing E2E test) · **Partially Implemented** (works with known defects or partial coverage) · **Planned-Stub** (declared but not functional) · **Unverified** (code present, no test evidence).

### 5.1 Authentication & Session
| Feature | Status | Evidence |
|---|---|---|
| Login / logout (Sanctum session) | Implemented | `routes/web.php:6-7`, `AuthController.php`; shared-guest E2E project passes |
| Role-based access control | Implemented | `CheckRole.php`, 32 `role:` route annotations in `routes/api.php` |
| Password reset / email verification | Unverified | No routes found; MAIL_* config keys exist but unused in app code |

### 5.2 Master Data (Superadmin)
| Feature | Status | Evidence |
|---|---|---|
| User management (list/edit/delete) | Implemented | `UserController.php`, `superadmin/user-management.spec.ts` passes |
| User create with NIDN/NUPTK validation | Partially Implemented | Known defect `SA-USER-ID-002/003`: NIDN/NUPTK-only create returns 422; test skips gracefully with console.log |
| Mahasiswa management | Partially Implemented | Known defect `SA-MHS-MUT-001`: create returns 422; test skips gracefully |
| Prodi management | Implemented | `ProdiController.php`, `prodi-management.spec.ts` passes (row-visibility check) |
| Skema / Kriteria Penilaian | Implemented | `SkemaController.php`, `KetuaCriteriaController.php`, screenshot F-MASTER-03 |
| Kolaborator / Peneliti Detail | Implemented | `KolaboratorController.php`, `PenelitiDetailController.php` |

### 5.3 Proposal Workflow (core domain)
| Feature | Status | Evidence |
|---|---|---|
| Proposal draft CRUD + document upload | Implemented | `Proposal/ProposalDraftController.php`, `Proposal/ProposalDocumentController.php` |
| Staff → Ketua seleksi flow | Implemented | `Proposal/ProposalSeleksiController.php`; ketua/staff proposal specs pass |
| Reviewer assignment (Staff assigns 3) | Implemented | `PenugasanReviewerController.php`; state `Menuggu penugasan Reviewer` (note DB spelling with one `g` must match exactly) |
| Workflow state machine | Implemented | `Proposal/ProposalWorkflowController.php` |
| Pengumuman / Surat Tugas generation | Implemented | `PengumumanSuratTugasController.php` + `PengumumanSuratTugasService.php` |
| DOCX export of proposal | Implemented | `ProposalDocxService.php` (PhpWord) |

Full state sequence (from working-tree verification):
`Dosen submits → "Menunggu review Staff LPPM" → Staff → "Menunggu review dari Ketua LPPM" → Ketua → "Menuggu penugasan Reviewer" → Staff assigns 3 → "Menunggu review" → "Menunggu persetujuan Ketua LPPM" → "Proposal Diterima"`

### 5.4 Laporan (Dissemination Reports)
| Feature | Status | Evidence |
|---|---|---|
| Laporan submission & review | Implemented | `LaporanController.php`, `LaporanMemberController.php`; dosen/ketua/reviewer laporan specs pass |
| Realisasi Anggaran (budget realization) | Implemented | `RealisasiAnggaranController.php`, `staff/dana` spec |
| Laporan akhir DOCX export | Implemented | `LaporanAkhirDocxService.php` |
| Reviewer laporan assessment | Implemented | `reviewer/laporan` spec passes |

### 5.5 Researcher Features (Dosen)
| Feature | Status | Evidence |
|---|---|---|
| Logbook pengerjaan | Implemented | `LogbookPengerjaanController.php`, `dosen/logbook` spec |
| Diseminasi (dissemination activities) | Implemented | `DiseminasiController.php`; screenshot F-DISEM-01 |
| Kegiatan pengajuan / edit request | Implemented | `KegiatanPengajuanController.php`, `KegiatanEditRequestController.php` |
| Scholar profile integration | Implemented | `ScholarController.php` + `Services/Scholar/` |

### 5.6 Reviewer Features
| Feature | Status | Evidence |
|---|---|---|
| Proposal review & scoring | Implemented | `ReviewController.php`, `reviewer/proposal` specs pass |
| Reviewer rule constraints | Implemented | `ketua/reviewer-rule.spec.ts` passes |

### 5.7 Notifications & Settings
| Feature | Status | Evidence |
|---|---|---|
| In-app notifications | Implemented | `NotificationController.php` + `NotificationService.php` + `useNotificationStore.js` |
| Notification history page | Implemented | `dashboard/pages/Notification/` |
| Profile / avatar settings | Implemented | `SettingsController.php`, `AvatarService.php` |

### 5.8 Administration & Reporting
| Feature | Status | Evidence |
|---|---|---|
| Per-role dashboard aggregates | Implemented | `DashboardController.php` with 5 role-specific endpoints (`routes/api.php:50-54`) |
| Publication category / Sitasi / Dana administration | Implemented | `PublicationCategoryController.php`, `SitasiController.php`, `DanaController.php` |
| Weekly Google Scholar sync | Implemented (operationally Unverified) | Scheduled `scholar:sync-weekly` weekly Monday 02:00 (`routes/console.php:11`); requires `SERPAPI_KEY` |
| Rektorat role views | Planned-Stub | See §4 |

---

## 6. Data Layer & Database

- **88 migrations** in `prisma-server/database/migrations/` — schema is fully migration-driven (good for handover).
- **31 Eloquent models** in `prisma-server/app/Models/`.
- **No roles table** — role is a string column on `users`.
- **21 seeders** in `prisma-server/database/seeders/`, split into:
  - `E2E*` (7 files + `E2EUnifiedSeeder`) — deterministic accounts for the Playwright suite.
  - `SUS*` (9 files + `SUSRunner`) — System Usability Study demo/scenario data.
  - `DanaWorkflowTestSeeder`, `ThesisScreenshotSeeder` — targeted fixtures.
- **Reference schema artifacts (root):** `PRISMA_ERD_SCHEMA_MANIFEST.md` (42 KB), `PRISMA_COMPLETE_ERD.dbml`, `prisma_server.sql` (full DB dump reference).
- **Environment files present:** `prisma-server/.env`, `.env.example`, `.env.testing`; `prisma/.env`, `.env.e2e`.
  - Testing environment uses `APP_ENV=testing`, database `prisma_e2e_testing`.
  - **Handover risk:** real `.env` files are present in the working tree (see §11).

**Testing credentials:** E2E accounts (all password `password`) exist for `dosen.e2e@`, `staff.lppm1@`, `ketua.lppm@`, `reviewer.e2e@`, `superadmin.e2e@itbss.ac.id`. Full values live in `docs/sus-testing-accounts.md` — existence flagged only; values intentionally not reproduced in this report.

---

## 7. API Surface

- **Entry:** `prisma-server/routes/api.php` — 186 `Route::` statements.
- **Authentication:** one `Route::middleware(['auth:sanctum'])->group(...)` wrapper at line 42 encloses **all** API endpoints; no unauthenticated API routes exist.
- **Authorization:** 32 `role:` middleware annotations; alias registered in `bootstrap/app.php:20`.
- **Public routes (3, `routes/web.php`):** `POST /login`, `POST /logout`, `GET /file/{path}` (static file serving with `Access-Control-Allow-Origin: *` — see §11).
- **Health check:** `/up` (`bootstrap/app.php:12`).
- **Controller groups:** Auth, AuthorizationRequest, Dashboard (5 roles), Users, Mahasiswa, Kolaborator, Prodi, Reviewer, PenugasanReviewer, Proposal (6 controllers under `Proposal/`), Skema, PenelitiDetail, Laporan, LaporanMember, RealisasiAnggaran, Dana, LogbookPengerjaan, Diseminasi, KegiatanPengajuan, KegiatanEditRequest, KetuaCriteria, PublicationCategory, Sitasi, Review, Notification, Scholar, Settings, Dosen, Dokumen.
- **No API documentation artifact** (no OpenAPI/Swagger spec found) — endpoint inventory must be derived from `routes/api.php`.

---

## 8. Frontend Architecture

- **Pattern:** Single-page dashboard. Route: `/dashboard?module=<key>`; `src/app/component/Libraries/utils/menu.js` maps `dashboardModules` keys → page components.
- **Role pages:** `src/app/dashboard/pages/{Admin,Dosen,Ketua,Reviewer,Home,Notification}/`.
- **No server-side rendering safeguards:** `middleware.ts` does not exist; no Next.js API routes. All auth is cookie/session-based against the Laravel API (Sanctum `statefulApi()`).
- **State:** 3 zustand stores (`useUserStore`, `useNotificationStore`, `useLoaderStore`).
- **Single public env var:** `NEXT_PUBLIC_URL`.
- **Language:** JavaScript/JSX (179 source files) — no TypeScript, so type safety relies on ESLint only.
- **Known frontend/backend contract hazards:** several mutation endpoints reject valid-looking payloads with 422 (§5.2) — these are backend validation defects, not test bugs.

---

## 9. Background Jobs, Scheduling & Integrations

| Item | Status | Evidence |
|---|---|---|
| Scheduler | Implemented | `routes/console.php:11` — `Schedule::command('scholar:sync-weekly')->weeklyOn(1, '02:00')` |
| Console command | Implemented | `app/Console/Commands/SyncScholarProfilesWeekly.php` (signature `scholar:sync-weekly`) |
| Queued job | Implemented | `app/Jobs/SyncScholarProfile.php` (DB queue driver) |
| SerpApi integration | Implemented | `app/Services/Scholar/SerpApiProvider.php` (HTTP calls with timeout), key from `SERPAPI_KEY` in `config/services.php:39` |
| Mail | Configured, Unverified | MAIL_* settings exist; no evidence of sent mail flows under test |
| Queue worker / cron deployment | **Unverified** | No systemd/supervisor/cron docs; must be part of deployment setup |

**Ops requirement for handover:** production needs (a) `php artisan schedule:run` cron every minute, (b) a queue worker for the DB queue, (c) `SERPAPI_KEY` configured — none of these are automated.

---

## 10. Testing & Verification Evidence

### 10.1 Suite composition
- **364 tests / 79 spec files** (`npx playwright test --list`, run from `prisma/`).
- **Projects** (`prisma/playwright.config.ts`): `auth-setup`, `auth-dosen-setup`, `auth-ketua-setup`, `auth-reviewer-setup`, `auth-superadmin-setup` (global login fixtures), plus test projects `staff-lppm`, `dosen`, `ketua`, `reviewer`, `superadmin`, `shared-guest`, and `screenshots`.
- Spec distribution: superadmin 14 files, staff 14, dosen 21, ketua 14, reviewer 9, shared 1, screenshots 1, plus `tests/playwright-rbb/` (representative black-box cases, 5 role files) and `tests/thesis-screenshots/`.

### 10.2 Latest results
- **Regression (everything except `screenshots`): 339 passed / 0 failed**, ~17.3 minutes.
- HTML report: `prisma/playwright-report/index.html`; machine-readable: `prisma/test-results/results.json`.
- After removal of the debug spec (`reviewer/rv-debug.spec.ts`, no assertions) the suite is **338 expected regression tests** — report tables should be re-generated with that number on the next run.

### 10.3 Quality gates (all passing)
- ESLint: **0 errors**.
- No `.only` focus tests; no TODO/FIXME markers in specs; no tautological assertions.
- Known application defects are handled with **graceful skips** (test logs via `console.log` and continues) rather than silent passes — flagged defects:
  - `SA-MHS-MUT-001` — Mahasiswa create returns 422.
  - `SA-USER-MUT-001` — User create returns 422.
  - `SA-USER-ID-002/003` — NIDN/NUPTK-only user create returns 422.

### 10.4 Supporting documentation
| Doc | Size | Purpose |
|---|---|---|
| `PRISMA_THESIS_SYSTEM_DOCUMENTATION.md` | 102 KB | 18-section full system documentation |
| `PRISMA_PLAYWRIGHT_TEST_SUITE_LIST.md` | 80 KB | Test inventory |
| `PROJECT_BRIEFING.md` | 64 KB | Project brief |
| `PRISMA_VERIFICATION_REPORT.md` | 45 KB | Verification results |
| `PRISMA_ERD_SCHEMA_MANIFEST.md` | 42 KB | Schema manifest |
| `PRISMA_DEPLOYMENT_CONFIGURATION.md` | 31 KB | Deployment config |
| `PRISMA_BLACK_BOX_REPRESENTATIVE_CASES.md` | 24 KB | Black-box cases |
| `EVIDENCE_RUN_SPEC.md` | 11 KB | Evidence run procedure |

---

## 11. Known Issues, Risks & Gaps

### Critical
1. **549 uncommitted changes** (177 modified + 372 untracked vs. 603 tracked files). The verified, passing state exists only in the working tree. *Risk: any disk/checkout accident loses the validated build.* **Mitigation: commit (or at minimum create a signed tag/branch) before handover.**
2. **Plaintext test credentials in-repo:** `docs/sus-testing-accounts.md`. Acceptable for an academic E2E suite only if the repository remains private and the accounts are testing-only.
3. **Live `.env` files present** (`prisma-server/.env`, `prisma/.env`, `.env.e2e`). Values not inspected per audit policy — must be reviewed for real secrets (DB passwords, mail credentials, `SERPAPI_KEY`) and excluded from any public release.
4. **No CI/CD and no containerization:** `.github/workflows` absent; no Dockerfile/compose. Every deployment is manual.

### High
5. **Three backend validation defects** (422 on otherwise-valid creates) — §10.3. Blocks real user creation flows for Mahasiswa and certain Users.
6. **File-serving route wide-open CORS:** `GET /file/{path}` returns files with `Access-Control-Allow-Origin: *` and a `.*` path wildcard (`routes/web.php:10-18`). Storage files are effectively world-readable if the URL is known; confirm this is intentional.
7. **State string dependency:** workflow transitions rely on exact Indonesian status strings, including the misspelled `Menuggu penugasan Reviewer`. Any "cleanup" of this typo will break tests and possibly stored data.
8. **No API schema/docs** — handover consumers must reverse-engineer `routes/api.php`.

### Medium
9. **Rektorat role is a stub** (§4) — either finish it or remove the legacy endpoint.
10. **Ops runbooks incomplete:** schedule cron, queue worker, and `SERPAPI_KEY` provisioning are not documented as deployment steps.
11. **No TypeScript** on the frontend — refactors are unprotected by the compiler.
12. **Screenshots project excluded** from the regression baseline (documentation-only; 364 total vs 338 regression).

### Low
13. Root-level doc set (~400 KB, 8 files) partially overlaps — handover should designate one canonical document.
14. `GOOGLE_SCHOLAR_TIMEOUT`, `SERPAPI_KEY` are app-level env vars beyond Laravel defaults; ensure they appear in the deployment manifest.

---

## 12. Recommended Handover Checklist

### Immediate (before any transfer)
- [ ] **Commit the working tree** (549 changes) with a message noting the verified state; tag e.g. `v1.0-verified-e2e`.
- [ ] Run the full regression once more from the committed state; attach fresh `playwright-report/index.html` and confirm **338 passed**.
- [ ] **Secret hygiene:** audit `prisma-server/.env*` and `prisma/.env*` for real secrets; rotate anything exposed; replace live values with placeholders in any shared copy.
- [ ] Confirm `docs/sus-testing-accounts.md` accounts are test-only and the repo stays private, or move the file out of version control.

### Functional fixes
- [ ] Resolve `SA-MHS-MUT-001`, `SA-USER-MUT-001`, `SA-USER-ID-002/003` (422 validation defects), then convert graceful skips into hard assertions.
- [ ] Decide on Rektorat: implement or remove `SettingsController` legacy endpoint (line 204).
- [ ] Review the `Access-Control-Allow-Origin: *` on `GET /file/{path}` and restrict if unintended.

### Operational readiness
- [ ] Document (or script) the production boot: `php artisan migrate --force`, seeder policy, `schedule:run` cron, queue worker, `SERPAPI_KEY` provisioning.
- [ ] Add a CI pipeline: ESLint → Playwright regression → deploy gate (no workflow exists today).
- [ ] Publish an API endpoint inventory (generate from `routes/api.php`) or an OpenAPI spec.

### Documentation handover
- [ ] Nominate the canonical document (suggest `PRISMA_THESIS_SYSTEM_DOCUMENTATION.md`) and mark the rest as supporting/appendix.
- [ ] Include: this audit, `PRISMA_DEPLOYMENT_CONFIGURATION.md`, `PRISMA_ERD_SCHEMA_MANIFEST.md`, `EVIDENCE_RUN_SPEC.md`, test-suite list.
- [ ] Record exact environment used for the verified run: PHP 8.2+, Laravel 12, Node (Next 16), MariaDB, `APP_ENV=testing`, DB `prisma_e2e_testing`.

### Knowledge transfer
- [ ] Walk through the Proposal Seleksi state machine (§5.3) — including the `Menuggu penugasan Reviewer` spelling caveat — with the receiving team.
- [ ] Demonstrate one full regression run end-to-end.
- [ ] Hand over repo admin rights for `https://github.com/LunarPandora/Prisma.git`.

---

*Audit conducted read-only; no source files, configuration, or test code were modified during this audit. Values from `.env` files and credential documents were intentionally not read or reproduced.*
