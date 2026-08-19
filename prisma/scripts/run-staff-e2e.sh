#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")"

echo "═══════════════════════════════════════════════"
echo "  Staff LPPM E2E Test Runner"
echo "═══════════════════════════════════════════════"

# 1. Reset database
echo ""
echo "[1/2] Resetting test database..."
bash ../prisma-server/scripts/e2e-reset.sh

# 2. Run Playwright tests
echo ""
echo "[2/2] Running Playwright tests..."
echo ""
E2E_FRONTEND_URL=http://localhost:3000 E2E_BACKEND_URL=http://localhost:8000 \
  npx playwright test --project=auth-setup --project=staff-lppm

echo ""
echo "═══════════════════════════════════════════════"
echo "  Done! View report: npm run test:e2e:staff:report"
echo "═══════════════════════════════════════════════"
