# PRISMA Deployment Configuration

> Complete deployment reference for PRISMA system on CloudPanel (NGINX + MariaDB).
> Generated from codebase inspection — not from documentation guesses.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Frontend Configuration](#2-frontend-configuration)
3. [Backend Configuration](#3-backend-configuration)
4. [Database Configuration](#4-database-configuration)
5. [Authentication & Session](#5-authentication--session)
6. [Environment Variables](#6-environment-variables)
7. [File Storage](#7-file-storage)
8. [Queue & Scheduler](#8-queue--scheduler)
9. [Real-time / WebSockets](#9-real-time--websockets)
10. [CORS Configuration](#10-cors-configuration)
11. [NGINX Configuration](#11-nginx-configuration)
12. [Security Considerations](#12-security-considerations)
13. [E2E Testing Separation](#13-e2e-testing-separation)
14. [SUS Testing Accounts](#14-sus-testing-accounts)
15. [Server Requirements](#15-server-requirements)
16. [CloudPanel Site Setup](#16-cloudpanel-site-setup)
17. [Deployment Sequence](#17-deployment-sequence)
18. [Post-Deployment Verification](#18-post-deployment-verification)
19. [Known Risks & Gotchas](#19-known-risks--gotchas)
20. [Rollback Plan](#20-rollback-plan)

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        CloudPanel (NGINX)                        │
├──────────────────────┬───────────────────────────────────────────┤
│  Frontend (Next.js)  │       Backend (Laravel API)               │
│  :3000 (dev)         │       :8000 (php artisan serve)           │
│  Static export or    │       FPM behind NGINX                    │
│  standalone Next.js  │                                           │
└──────────┬───────────┴──────────────────┬────────────────────────┘
           │ Cookie (XSRF + Session)       │ REST API (JSON)
           └───────────────────────────────┘
                        │
              ┌─────────┴─────────┐
              │    MariaDB DB      │
              │ prisma_server (prod)│
              │ prisma_e2e_testing  │
              └────────────────────┘
```

**Runtime Model:**
- **Frontend:** Next.js 16.1.6, React 19, standalone Node.js server
- **Backend:** Laravel 12, PHP 8.2+, MariaDB (11.x)
- **Auth:** Laravel Sanctum (cookie-based SPA authentication)
- **Session:** Database-backed (MariaDB `sessions` table)
- **Queue:** Database-backed (MariaDB `jobs` table) — minimal usage
- **Cache:** Database-backed (MariaDB `cache` table)
- **Storage:** Local disk (`storage/app/public`) with symlink to `public/storage`

---

## 2. Frontend Configuration

| Property | Value |
|---|---|
| **Framework** | Next.js 16.1.6 (Pages Router) |
| **React** | 19.2.3 |
| **Node.js** | ≥18.17.0 |
| **Package Manager** | npm (package-lock.json present) |
| **TypeScript** | No (uses jsconfig.json) |
| **CSS** | Tailwind CSS 4 + @tailwindcss/typography |
| **State** | Zustand 5.0.11 (persisted to localStorage) |
| **HTTP Client** | Axios 1.13.6 (withCredentials, XSRF-TOKEN injection) |
| **Compiler** | React Compiler (babel-plugin-react-compiler 1.0.0) |

**Key Config (`next.config.mjs`):**
```js
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**',
      },
    ],
  },
};
```

**Important Notes:**
- No `middleware.ts` exists — all auth guards are client-side (`src/app/dashboard/layout.jsx`)
- No `tsconfig.json` — project is pure JavaScript
- Only 1 env var needed: `NEXT_PUBLIC_URL` (set to backend URL)
- `useRouter()` is used directly without Suspense wrapping in most pages

**Build & Start:**
```bash
cd prisma
npm ci
npm run build
npm run start          # standalone server on :3000
```

**Static File Serving (alternative):**
```bash
npm run build          # outputs to .next/
npm run start          # recommended over static export
```
> Static export (`output: 'export'`) is NOT configured. The app must run as a Node.js server.

---

## 3. Backend Configuration

| Property | Value |
|---|---|
| **Framework** | Laravel 12.0 |
| **PHP** | ^8.2 |
| **Auth** | Laravel Sanctum ^4.0 |
| **Image Processing** | intervention/image ^4.0 |
| **Word Export** | phpoffice/phpword ^1.4 |
| **Database** | MariaDB (mariadb driver) |
| **Session** | Database-backed |
| **Cache** | Database-backed |
| **Queue** | Database-backed |
| **Filesystem** | Local (`storage/app/public`) |

**Key Composer Packages:**
```json
{
  "laravel/framework": "^12.0",
  "laravel/sanctum": "^4.0",
  "laravel/tinker": "^2.10.1",
  "intervention/image": "^4.0",
  "phpoffice/phpword": "^1.4"
}
```

**Service Provider (`AppServiceProvider.php`):**
```php
// Binds Google Scholar provider
$this->app->bind(GoogleScholarProvider::class, SerpApiProvider::class);

// Morph map for polymorphic relationships
Relation::morphMap([
    'Skema' => \App\Models\Skema::class,
    'KegiatanPengajuan' => \App\Models\KegiatanPengajuan::class,
]);
```

**Middleware Stack (Http/Kernel.php):**
- `TrustHosts`, `TrustProxies`, `PreventRequestsDuringMaintenance`, `ValidatePostSize`, `TrimStrings`, `ConvertEmptyStringsToNull`
- Auth: `EncryptCookies`, `AddQueuedCookiesToResponse`, `StartSession`, `ShareErrorsFromSession`, `VerifyCsrfToken` → SubstituteBindings
- API: `throttle:api`, `EnsureFrontendRequestsAreStateful` (Sanctum)
- Custom: `CheckRole` — checks `$user->role` against allowed roles array

**Build & Start:**
```bash
cd prisma-server
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan serve --host=0.0.0.0 --port=8000    # dev only
# Production: use PHP-FPM behind NGINX
```

---

## 4. Database Configuration

| Property | Value |
|---|---|
| **Engine** | MariaDB (11.x recommended) |
| **Driver** | `mariadb` (Laravel's native MariaDB driver) |
| **Charset** | `utf8mb4` |
| **Collation** | `utf8mb4_unicode_ci` |
| **Port** | 3306 |
| **Production DB** | `prisma_server` |
| **E2E Testing DB** | `prisma_e2e_testing` |
| **Tables** | 42 total (30 application + 12 framework) |
| **Migrations** | 86 files in `database/migrations/` |
| **Models** | 31 Eloquent models |
| **FK Constraints** | 39 physical (MariaDB-enforced) |

**Database Config (`config/database.php`):**
```php
'mariadb' => [
    'driver' => 'mariadb',
    'host' => env('DB_HOST', '127.0.0.1'),
    'port' => env('DB_PORT', '3306'),
    'database' => env('DB_DATABASE', 'laravel'),
    'username' => env('DB_USERNAME', 'root'),
    'password' => env('DB_PASSWORD', ''),
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'strict' => true,
],
```

**Critical Schema Constraints:**
- `laporan` has `unique(proposal_id, semester)` — one laporan per proposal per semester
- `settings.rektor` is `bigint unsigned` FK → `users.id`
- `peneliti_details.penugasan_reviewer_id` is nullable (FK constraint exists but nullable)
- User roles: `['Superadmin','Staff LPPM','Ketua LPPM','Dosen','Reviewer','Rektorat']`
- Laporan statuses: `Dalam pengerjaan`, `Menunggu review Admin/Staff/Reviewer`, `Menunggu hasil dari Reviewers`, `Menunggu keputusan Ketua`, `Selesai`
- Proposal statuses: Draft, Ditarik, Ditolak, `Menunggu proposal untuk diupload`, `Menunggu review dari Ketua LPPM`, `Menunggu review Staff LPPM`, `Menunggu penugasan reviewer`, `Menunggu review`, `Menunggu persetujuan Ketua LPPM`, `Proposal Diterima`, Revisi

**Database Seeders:**
```bash
php artisan db:seed                          # default (DatabaseSeeder)
php artisan db:seed --class=SUSDemoSeeder    # SUS testing accounts
php artisan db:seed --class=ThesisScreenshotSeeder  # thesis screenshot fixtures
```

---

## 5. Authentication & Session

**Auth Flow:**
1. Frontend calls `GET /sanctum/csrf-cookie` (via `initAuth()` in `api.js`)
2. Browser stores `XSRF-TOKEN` cookie
3. Frontend sends `POST /login` with `{email, password}`
4. Backend validates, creates session, returns user object
5. Axios interceptor injects `X-XSRF-TOKEN` header on every request
6. 401/419 errors trigger `expiredSession()` → clears Zustand store → redirects to `/login`

**Session Configuration:**
```php
// .env
SESSION_DRIVER=database      // uses 'sessions' table
SESSION_LIFETIME=120         // 2 hours
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=localhost     // UPDATE for production domain
SESSION_SECURE_COOKIE=null   // SET to true for HTTPS
SESSION_SAME_SITE=lax
```

**Sanctum Configuration:**
```php
// config/sanctum.php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,localhost:8000,127.0.0.1,127.0.0.1:8000,::1',
    env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
))),
```

**Production `.env` Updates Required:**
```bash
SESSION_DOMAIN=yourdomain.com
SESSION_SECURE_COOKIE=true
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
APP_URL=https://yourdomain.com
```

**Client-Side Auth Guard:**
- `src/app/dashboard/layout.jsx` checks `useUserStore` on mount
- If no user → redirects to `/login`
- No server-side middleware protection for frontend routes (all client-side)

**Role-Based Access:**
- Backend uses `CheckRole` middleware: `->middleware('role:Superadmin,Staff LPPM,Ketua LPPM')`
- Frontend checks `user.role` in each page component

---

## 6. Environment Variables

### Frontend (`prisma/.env`)
```bash
NEXT_PUBLIC_URL=http://localhost:8000         # Backend API base URL
```

> Only 1 env var is required. Set to production backend URL.

### Backend (`prisma-server/.env`)
```bash
# App
APP_NAME=PRISMA
APP_ENV=production                    # CHANGE from 'local'
APP_KEY=base64:...                    # generate with php artisan key:generate
APP_DEBUG=false                       # CHANGE to false in production
APP_URL=https://yourdomain.com

# Database
DB_CONNECTION=mariadb
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=prisma_server             # production DB name
DB_USERNAME=prisma_user               # dedicated DB user (NOT root)
DB_PASSWORD=<strong-password>

# Session
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=yourdomain.com
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax

# Cache & Queue
CACHE_STORE=database
QUEUE_CONNECTION=database

# Filesystem
FILESYSTEM_DISK=local

# Sanctum
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com

# Mail (if needed)
MAIL_MAILER=smtp
MAIL_HOST=smtp.yourdomain.com
MAIL_PORT=587
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=<mail-password>
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="PRISMA"

# Google Scholar (optional)
GOOGLE_SCHOLAR_PROVIDER=serpapi
SERPAPI_KEY=<your-key>
GOOGLE_SCHOLAR_TIMEOUT=30
```

### E2E Testing (`prisma/.env.e2e`)
```bash
NEXT_PUBLIC_URL=http://localhost:8000
```

### Backend Testing (`prisma-server/.env.testing`)
```bash
DB_CONNECTION=mariadb
DB_DATABASE=prisma_e2e_testing
APP_ENV=testing
```

---

## 7. File Storage

**Storage Disk:**
```php
// config/filesystems.php
'disks' => [
    'local' => [
        'driver' => 'local',
        'root' => storage_path('app/private'),
        'serve' => true,
        'throw' => false,
    ],
    'public' => [
        'driver' => 'local',
        'root' => storage_path('app/public'),    // <-- main storage
        'url' => env('APP_URL').'/storage',
        'visibility' => 'public',
        'throw' => false,
    ],
],
```

**Usage in Code:**
```php
// DocumentService.php — file uploads
Storage::disk('public')->put($path, $content);

// AvatarService.php — avatar uploads
Storage::disk('public')->put($avatarPath, $imageContent);
Storage::disk('public')->url($avatarPath);   // returns '/storage/avatars/...'
```

**Files Stored:**
- `avatars/{user_id}.{ext}` — user profile pictures
- `documents/proposals/{proposal_id}/{filename}` — proposal documents
- `documents/laporan/{laporan_id}/{filename}` — laporan documents
- `documents/dana/{proposal_id}/{filename}` — dana documents

**Storage Symlink (REQUIRED):**
```bash
php artisan storage:link
# Creates: public/storage → storage/app/public
```

**Image Optimization:**
- `intervention/image ^4.0` is installed
- AvatarService resizes to max 1000x1000px

**Frontend Image Config (`next.config.mjs`):**
```js
images: {
  remotePatterns: [
    {
      protocol: 'http',
      hostname: 'localhost',
      port: '8000',
      pathname: '/storage/**',
    },
  ],
},
```
> UPDATE `hostname` to production domain and `protocol` to `https` if serving images from backend.

---

## 8. Queue & Scheduler

**Queue Configuration:**
```php
// .env
QUEUE_CONNECTION=database    // uses 'jobs' table
```

**Queue Usage (Minimal):**
- Only **1 job class** exists: `App\Jobs\SyncScholarProfile`
  - Syncs Google Scholar data for a user
  - Dispatched by: `SyncScholarProfilesWeekly` command, `ScholarController`
  - Uses SerpApi for data retrieval

**Scheduler:**
```php
// routes/console.php
Schedule::commands();    // No custom scheduled tasks
```
- No cron jobs are configured
- No scheduled commands defined
- The `Scheduler` in CloudPanel is NOT required

**Queue Worker (if needed):**
```bash
php artisan queue:work --sleep=3 --tries=3
```
> Since only Scholar sync uses the queue, you can skip the queue worker initially. Add it later if you want background Scholar profile syncing.

---

## 9. Real-time / WebSockets

**Status: NOT USED**

- No Pusher, Soketi, or Reverb configuration
- No Broadcasting configured (`BROADCAST_CONNECTION=log`)
- No WebSocket server needed
- No real-time features (chat, notifications) in production code
- Frontend uses polling (axios requests) for all data updates

---

## 10. CORS Configuration

```php
// config/cors.php
'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout'],
'allowed_methods' => ['*'],
'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000')],
'allowed_origins_patterns' => [],
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => true,    // CRITICAL for cookie-based auth
```

**Production CORS Update:**
```bash
FRONTEND_URL=https://yourdomain.com    # add to .env
```

> `supports_credentials: true` is required for Sanctum cookie-based auth to work cross-origin.

---

## 11. NGINX Configuration

### Option A: Single Domain (Recommended)

Route everything through one domain with NGINX reverse proxy:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    root /home/prisma/public;

    # API + Backend
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /sanctum {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Login/Logout routes
    location ~ ^/(login|logout)$ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Storage (uploaded files)
    location /storage {
        alias /home/prisma/prisma-server/storage/app/public;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Next.js frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Option B: Two-Subdomain Setup

```nginx
# Frontend: app.yourdomain.com
server {
    listen 443 ssl http2;
    server_name app.yourdomain.com;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# Backend: api.yourdomain.com
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    root /home/prisma/prisma-server/public;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location /storage {
        alias /home/prisma/prisma-server/storage/app/public;
        expires 30d;
    }
}
```

> **Option A is simpler** and avoids CORS complexity. Use Option B only if you need separate domains.

---

## 12. Security Considerations

| Setting | Value | Notes |
|---|---|---|
| `APP_DEBUG` | `false` | Never expose stack traces in production |
| `SESSION_SECURE_COOKIE` | `true` | Require HTTPS for cookies |
| `SESSION_HTTP_ONLY` | `true` | Prevent JS access to session cookie |
| `SESSION_SAME_SITE` | `lax` | CSRF protection |
| `SANCTUM_STATEFUL_DOMAINS` | Production domain only | Don't include localhost |
| `BCRYPT_ROUNDS` | 12 | Default, adequate |
| `APP_KEY` | Random 32-byte base64 | Never commit to git |
| `DB_PASSWORD` | Strong password | Use dedicated DB user, not root |
| CORS `supports_credentials` | `true` | Required for Sanctum cookies |
| `VerifyCsrfToken` | Enabled | Protects all non-API routes |
| `TrustProxies` | Enabled | Required behind reverse proxy |

**Additional Recommendations:**
- Use a dedicated MySQL user (not root) with only required privileges
- Enable MariaDB audit logging
- Set up automatic backups
- Use Let's Encrypt for SSL certificates
- Set `php_admin_value[memory_limit] = 256M` in PHP-FPM config (for file processing)
- Set `upload_max_filesize = 20M` and `post_max_size = 25M` in PHP config

---

## 13. E2E Testing Separation

**Two completely separate databases:**

| Database | Purpose | Seeding |
|---|---|---|
| `prisma_server` | Production data | `DatabaseSeeder` |
| `prisma_e2e_testing` | Playwright E2E tests | Role-specific seeders |

**E2E Reset Script:**
```bash
bash prisma-server/scripts/e2e-reset.sh <role>
# Roles: staff, dosen, ketua, reviewer, superadmin
```

**E2E Test Commands:**
```bash
# Reset DB → Run role-specific tests
npm run test:e2e:staff
npm run test:e2e:dosen
npm run test:e2e:ketua
npm run test:e2e:reviewer
npm run test:e2e:superadmin
```

**E2E Backend Config:**
```bash
# prisma-server/.env.testing
DB_DATABASE=prisma_e2e_testing
APP_ENV=testing
```

**Key E2E Users (seeded per role):**
| ID | Name | Email | Role |
|---|---|---|---|
| 1 | Superadmin User | superadmin@itbss.ac.id | Superadmin |
| 2 | Ketua LPPM User | ketua.lppm@itbss.ac.id | Ketua LPPM |
| 3 | Staff LPPM 1 | staff.lppm@itbss.ac.id | Staff LPPM |
| 4 | Staff LPPM 2 | staff2.lppm@itbss.ac.id | Staff LPPM |
| 5 | Dosen A | dosen.a@itbss.ac.id | Dosen |
| 6 | Dosen B | dosen.b@itbss.ac.id | Dosen |

---

## 14. SUS Testing Accounts

Created by `SUSDemoSeeder.php`:

| Email | Password | Role |
|---|---|---|
| sustest.dosen@itbss.ac.id | password | Dosen |
| sustest.staff@itbss.ac.id | password | Staff LPPM |
| sustest.ketua@itbss.ac.id | password | Ketua LPPM |
| sustest.reviewer@itbss.ac.id | password | Reviewer |
| sustest.superadmin@itbss.ac.id | password | Superadmin |

**Seed with:**
```bash
php artisan db:seed --class=SUSDemoSeeder
```

**SUS Dataset Summary:**
- 6 Skema (Skema 1-6), 8 Kegiatan (KEGIATAN-001 through KEGIATAN-008)
- 3 Proposals (PKM-2025-00001, PKM-2025-00002, PKM-2025-00003)
- 3 Laporan in various statuses
- 3 Mahasiswa, 3 Kolaborator, 3 Peneliti Detail
- 2 Anggaran items, 2 Dana entries
- 3 Publications, 3 Logbook entries

---

## 15. Server Requirements

### Minimum Requirements
- **PHP:** 8.2 or higher
- **MariaDB:** 10.6+ (or MySQL 8.0+)
- **Node.js:** 18.17.0 or higher (for frontend build)
- **Composer:** 2.x
- **RAM:** 2GB minimum, 4GB recommended
- **Disk:** 20GB minimum

### Required PHP Extensions
```
bcmath, ctype, curl, dom, fileinfo, filter, gd, hash, mbstring,
mysqlnd, openssl, pcre, pdo, pdo_mysql, session, tokenizer, xml, zip
```

### PHP Configuration
```ini
memory_limit = 256M
upload_max_filesize = 20M
post_max_size = 25M
max_execution_time = 60
max_input_time = 60
opcache.enable = 1
opcache.memory_consumption = 128
opcache.max_accelerated_files = 10000
```

### Node.js (for frontend build only)
```bash
node -v    # v18.17.0 or higher
npm -v     # v9+ or higher
```

---

## 16. CloudPanel Site Setup

### Step 1: Create Site in CloudPanel

1. **Sites** → **Add Site**
2. **Type:** Node.js Application
3. **Domain:** `yourdomain.com`
4. **Node.js Version:** 18.x or 20.x
5. **Application Root:** `/home/prisma`
6. **Application Startup File:** `server.js` (Next.js standalone) or `npm run start`

### Step 2: Backend Setup

1. Create a **PHP Site** (not Node.js) for the backend
2. **Domain:** `api.yourdomain.com` (or subdirectory)
3. **Document Root:** `/home/prisma/prisma-server/public`
4. **PHP Version:** 8.2+
5. **Run as:** `prisma` user (not `www-data`)

### Step 3: MariaDB Setup

1. **Databases** → **Add Database**
2. **Database Name:** `prisma_server`
3. **User:** `prisma_user`
4. **Password:** `<strong-password>`
5. **Grant All Privileges**

### Step 4: PHP-FPM Configuration

```ini
; /etc/php/8.2/fpm/pool.d/prisma.conf
[prisma]
user = prisma
group = prisma
listen = /var/run/php/php8.2-fpm-prisma.sock
pm = dynamic
pm.max_children = 10
pm.start_servers = 3
pm.min_spare_servers = 2
pm.max_spare_servers = 5
php_admin_value[memory_limit] = 256M
php_admin_value[upload_max_filesize] = 20M
php_admin_value[post_max_size] = 25M
php_admin_value[opcache.enable] = 1
```

### Step 5: NGINX Configuration

Use Option A (single domain) or Option B (two-subdomain) from [Section 11](#11-nginx-configuration).

---

## 17. Deployment Sequence

### First-Time Deployment

```bash
# 1. SSH into server
ssh prisma@yourserver

# 2. Clone repository
cd /home/prisma
git clone <repo-url> .

# 3. Backend setup
cd prisma-server
composer install --no-dev --optimize-autoloader
cp .env.example .env
php artisan key:generate
# Edit .env with production values (see Section 6)
php artisan migrate --force
php artisan db:seed                    # optional: seed initial data
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 4. Frontend setup
cd ../prisma
npm ci
# Edit .env (NEXT_PUBLIC_URL=https://yourdomain.com)
npm run build

# 5. Start Next.js server (as PM2 or systemd service)
pm2 start npm --name "prisma-frontend" -- run start
pm2 save

# 6. Set up PHP-FPM pool for backend
# Configure as described in Section 16

# 7. Test
curl -I https://yourdomain.com
curl https://yourdomain.com/api/health    # if health endpoint exists
```

### Update Deployment

```bash
# 1. Pull latest code
cd /home/prisma
git pull origin main

# 2. Backend updates
cd prisma-server
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 3. Frontend updates
cd ../prisma
npm ci
npm run build

# 4. Restart services
pm2 restart prisma-frontend
sudo systemctl restart php8.2-fpm
sudo systemctl restart nginx

# 5. Storage symlink (if new files added)
php artisan storage:link
```

---

## 18. Post-Deployment Verification

### Checklist

```bash
# 1. Frontend accessible
curl -I https://yourdomain.com
# Expected: HTTP/2 200

# 2. Backend API accessible
curl -I https://yourdomain.com/api
# Expected: HTTP/2 200 or 401 (unauthenticated)

# 3. Sanctum CSRF cookie
curl -c cookies.txt https://yourdomain.com/sanctum/csrf-cookie -v
# Expected: Set-Cookie: XSRF-TOKEN=...

# 4. Login endpoint
curl -X POST https://yourdomain.com/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  -b cookies.txt -c cookies.txt -v
# Expected: HTTP/2 200 with user object

# 5. Storage symlink
ls -la /home/prisma/prisma-server/public/storage
# Expected: storage -> /home/prisma/prisma-server/storage/app/public

# 6. Storage accessible
curl -I https://yourdomain.com/storage/avatars/1.jpg
# Expected: HTTP/2 200 (or 404 if no avatar)

# 7. Database connection
cd /home/prisma/prisma-server
php artisan tinker --execute="echo DB::connection()->getPdo() ? 'OK' : 'FAIL';"

# 8. Session table
php artisan tinker --execute="echo DB::table('sessions')->count() . ' sessions';"

# 9. Cache working
php artisan tinker --execute="Cache::put('test', 'ok'); echo Cache::get('test');"
# Expected: ok

# 10. Queue table exists
php artisan tinker --execute="echo DB::table('jobs')->count() . ' jobs';"
```

### Common Issues

| Issue | Fix |
|---|---|
| CORS errors | Check `FRONTEND_URL` in `.env`, ensure `supports_credentials: true` |
| 419 CSRF mismatch | Verify `SANCTUM_STATEFUL_DOMAINS` includes production domain |
| Session not persisting | Check `SESSION_DOMAIN` matches production domain, `SESSION_SECURE_COOKIE=true` |
| Storage 404 | Run `php artisan storage:link`, check permissions |
| Migration errors | Run `php artisan migrate --force`, check MariaDB version |
| Frontend can't reach API | Verify `NEXT_PUBLIC_URL` points to backend, check NGINX proxy |

---

## 19. Known Risks & Gotchas

### Critical

1. **`Rektorat` role is legacy/unused** — Do not assign to new users. Only 1 record exists (id=7, `rektorat@itbss.ac.id`). User model's enum list includes it but it's dead code.

2. **Typo in laporan status enum** — `Menuggu penugasan Reviewer` (missing 'n'). Do NOT fix without migration to update all existing records.

3. **`dana_disetujui` is inert** — This proposal field exists but does NOT block any workflow. Proposals progress through all stages regardless of this value.

4. **`peneliti_details.penugasan_reviewer_id` is nullable** — FK constraint exists but the column allows NULL. This is intentional (not all peneliti have reviewer assignments).

5. **14 Eloquent-only relationships** — These are NOT enforced at the database level. Models: `Laporan` (3), `Proposal` (2), `LogbookPengerjaan` (2), `KegiatanPengajuan` (2), `PenelitiDetail` (2), `PenugasanReviewer` (1), `PengembalianDana` (1), `User` (1).

6. **1 unused column** — `laporan.link_luaran_drive_id` is never read or written. Do not remove without migration.

### Moderate

7. **SerpApi key is in `.env`** — The Google Scholar sync uses SerpApi. Rotate the key if it's exposed.

8. **`APP_DEBUG=false` is required** — Never expose stack traces in production.

9. **Session is database-backed** — The `sessions` table must exist and be accessible. MariaDB must be running.

10. **Queue is database-backed** — The `jobs` table must exist. If queue worker isn't running, Scholar sync jobs will pile up (but won't crash the app).

### Minor

11. **React Compiler enabled** — `reactCompiler: true` in `next.config.mjs`. This is stable but could cause issues with very old browser targets.

12. **No TypeScript** — All frontend code is JavaScript with jsconfig.json path aliases. Type safety is limited.

13. **No middleware.ts** — All auth guards are client-side. Protected routes can be accessed directly if the URL is known (but the UI will redirect to login).

---

## 20. Rollback Plan

### Application Rollback

```bash
# 1. Revert code
cd /home/prisma
git log --oneline -5    # find commit to revert to
git checkout <commit-hash> -- prisma/ prisma-server/

# 2. Rebuild frontend
cd prisma
npm ci
npm run build
pm2 restart prisma-frontend

# 3. Rollback migrations (if needed)
cd ../prisma-server
php artisan migrate:rollback --step=1    # rollback last batch

# 4. Restart backend
sudo systemctl restart php8.2-fpm
```

### Database Rollback

```bash
# From backups
mysql -u root -p prisma_server < /backups/prisma_server_backup.sql

# Re-seed if needed
cd /home/prisma/prisma-server
php artisan db:seed
```

### Full Restore

```bash
# 1. Restore database
mysql -u root -p prisma_server < /backups/prisma_server_full.sql

# 2. Restore storage
cp -r /backups/storage/* /home/prisma/prisma-server/storage/app/public/

# 3. Restore code
cd /home/prisma
git checkout main
# or git checkout <tag>

# 4. Rebuild and restart
cd prisma && npm ci && npm run build && pm2 restart prisma-frontend
cd ../prisma-server && composer install --no-dev
sudo systemctl restart php8.2-fpm
```

---

## Appendix: Quick Reference

### File Locations

| File | Path |
|---|---|
| Frontend env | `prisma/.env` |
| Backend env | `prisma-server/.env` |
| NGINX config | `/etc/nginx/sites-available/prisma` |
| PHP-FPM config | `/etc/php/8.2/fpm/pool.d/prisma.conf` |
| Laravel config | `prisma-server/config/` |
| Storage root | `prisma-server/storage/app/public/` |
| Frontend build | `prisma/.next/` |
| Backend public | `prisma-server/public/` |
| E2E seed script | `prisma-server/scripts/e2e-reset.sh` |

### Ports

| Service | Port |
|---|---|
| NGINX (HTTPS) | 443 |
| NGINX (HTTP → redirect) | 80 |
| Next.js dev | 3000 |
| Laravel dev | 8000 |
| MariaDB | 3306 |

### Processes to Manage

| Process | Start Command | Restart |
|---|---|---|
| Next.js | `pm2 start npm --name "prisma-frontend" -- run start` | `pm2 restart prisma-frontend` |
| PHP-FPM | `sudo systemctl start php8.2-fpm` | `sudo systemctl restart php8.2-fpm` |
| NGINX | `sudo systemctl start nginx` | `sudo systemctl restart nginx` |
| MariaDB | `sudo systemctl start mariadb` | `sudo systemctl restart mariadb` |
| Queue Worker | `php artisan queue:work` | `php artisan queue:restart` |
