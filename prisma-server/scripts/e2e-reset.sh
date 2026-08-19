#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$(dirname "$SCRIPT_DIR")"

# Parse role argument (default: staff)
ROLE="${1:-staff}"

echo "═══════════════════════════════════════════════"
echo "  E2E Test Database Reset ($ROLE)"
echo "═══════════════════════════════════════════════"

# Safety check: ensure we're not touching production
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
    echo "If the database doesn't exist, create it manually:"
    echo "  CREATE DATABASE prisma_e2e_testing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
}

# Select seeder based on role
if [ "$ROLE" = "dosen" ]; then
    SEEDER="E2EDosenSeeder"
    echo "Running migrate:fresh with E2EDosenSeeder..."
elif [ "$ROLE" = "ketua" ]; then
    SEEDER="E2EKetuaSeeder"
    echo "Running migrate:fresh with E2EKetuaSeeder..."
elif [ "$ROLE" = "reviewer" ]; then
    SEEDER="E2EReviewerSeeder"
    echo "Running migrate:fresh with E2EReviewerSeeder..."
elif [ "$ROLE" = "superadmin" ]; then
    SEEDER="E2ESuperadminSeeder"
    echo "Running migrate:fresh with E2ESuperadminSeeder..."
else
    SEEDER="E2EStaffSeeder"
    echo "Running migrate:fresh with E2EStaffSeeder..."
fi

cd "$SERVER_DIR"
php artisan migrate:fresh --env=testing --force --seeder="$SEEDER"

echo ""
echo "═══════════════════════════════════════════════"
echo "  Database reset complete!"
echo "═══════════════════════════════════════════════"
echo ""
echo "Test database: prisma_e2e_testing"

if [ "$ROLE" = "dosen" ]; then
    echo "Dosen E2E credentials:"
    echo "  Email: dosen.e2e@itbss.ac.id"
    echo "  Password: password"
elif [ "$ROLE" = "ketua" ]; then
    echo "Ketua E2E credentials:"
    echo "  Email: ketua.lppm@itbss.ac.id"
    echo "  Password: password"
elif [ "$ROLE" = "reviewer" ]; then
    echo "Reviewer E2E credentials:"
    echo "  Email: reviewer.e2e@itbss.ac.id"
    echo "  Password: password"
elif [ "$ROLE" = "superadmin" ]; then
    echo "Superadmin E2E credentials:"
    echo "  Email: superadmin.e2e@itbss.ac.id"
    echo "  Password: password"
else
    echo "Staff LPPM credentials:"
    echo "  Email: staff.lppm1@itbss.ac.id"
    echo "  Password: password"
fi
