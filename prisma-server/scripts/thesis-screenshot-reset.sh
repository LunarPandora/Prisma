#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$(dirname "$SCRIPT_DIR")"

echo "═══════════════════════════════════════════════"
echo "  Thesis Screenshot Database Reset"
echo "═══════════════════════════════════════════════"

# Safety check
if grep -q "APP_ENV=production" "$SERVER_DIR/.env.testing" 2>/dev/null; then
    echo "ERROR: .env.testing has APP_ENV=production. Aborting."
    exit 1
fi

if grep -q "DB_DATABASE=prisma_server" "$SERVER_DIR/.env.testing" 2>/dev/null; then
    echo "ERROR: .env.testing points to production DB (prisma_server). Aborting."
    exit 1
fi

echo ""
echo "Creating test database if not exists..."
mysql -u root -padmin123 -e "CREATE DATABASE IF NOT EXISTS prisma_e2e_testing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || {
    echo "WARNING: Could not create database via mysql CLI."
}

cd "$SERVER_DIR"
php artisan migrate:fresh --env=testing --force --seeder="ThesisScreenshotSeeder"

echo ""
echo "═══════════════════════════════════════════════"
echo "  Database reset complete!"
echo "═══════════════════════════════════════════════"
echo ""
echo "Test database: prisma_e2e_testing"
echo ""
echo "Thesis screenshot credentials:"
echo "  Staff LPPM:  staff.lppm1@itbss.ac.id / password"
echo "  Dosen:        dosen.e2e@itbss.ac.id / password"
echo "  Ketua LPPM:   ketua.lppm@itbss.ac.id / password"
echo "  Reviewer:     reviewer.e2e@itbss.ac.id / password"
echo "  Superadmin:   superadmin.e2e@itbss.ac.id / password"
