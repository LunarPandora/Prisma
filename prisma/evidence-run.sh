#!/bin/bash

SERVER_DIR="/Users/wendy/Projects/prisma_copy/prisma-server"
PRISMA_DIR="/Users/wendy/Projects/prisma_copy/prisma"

export E2E_FRONTEND_URL=http://localhost:3000
export E2E_BACKEND_URL=http://localhost:8000

cd "$PRISMA_DIR"
rm -rf test-results/*

echo "=== Resetting DB with unified seeder ==="
cd "$SERVER_DIR"
bash scripts/e2e-reset.sh all 2>&1 | tail -5
echo ""
cd "$PRISMA_DIR"

echo "=== Running full test suite ==="

echo "--- shared-guest ---"
npx playwright test --project=shared-guest 2>&1
echo ""

echo "--- staff-lppm (with fresh DB) ---"
cd "$SERVER_DIR" && bash scripts/e2e-reset.sh staff 2>&1 | tail -3 && cd "$PRISMA_DIR"
npx playwright test --project=auth-setup --project=staff-lppm 2>&1
echo ""

echo "--- dosen (with fresh DB) ---"
cd "$SERVER_DIR" && bash scripts/e2e-reset.sh dosen 2>&1 | tail -3 && cd "$PRISMA_DIR"
npx playwright test --project=auth-dosen-setup --project=dosen 2>&1
echo ""

echo "--- ketua (with fresh DB) ---"
cd "$SERVER_DIR" && bash scripts/e2e-reset.sh ketua 2>&1 | tail -3 && cd "$PRISMA_DIR"
npx playwright test --project=auth-ketua-setup --project=ketua 2>&1
echo ""

echo "--- reviewer (with fresh DB) ---"
cd "$SERVER_DIR" && bash scripts/e2e-reset.sh reviewer 2>&1 | tail -3 && cd "$PRISMA_DIR"
npx playwright test --project=auth-reviewer-setup --project=reviewer 2>&1
echo ""

echo "--- superadmin (with fresh DB) ---"
cd "$SERVER_DIR" && bash scripts/e2e-reset.sh superadmin 2>&1 | tail -3 && cd "$PRISMA_DIR"
npx playwright test --project=auth-superadmin-setup --project=superadmin 2>&1
echo ""

echo "=== FINAL SUMMARY ==="
echo "See test-results/ for details"
