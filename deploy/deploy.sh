#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Travello — Deploy Script
# Builds Docker image and starts/restarts the frontend container.
# Run from the project root: bash deploy/deploy.sh
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "======================================================="
echo "  Travello — Deploying Frontend"
echo "======================================================="

# ── Guard: .env must exist ───────────────────────────────────────────────────
if [ ! -f ".env" ]; then
  echo "❌  ERROR: .env file not found in $PROJECT_ROOT"
  echo "   Run: cp .env.example .env && nano .env"
  exit 1
fi

# Load .env into current shell (for variable inspection only — Docker reads it natively)
set -a; source .env; set +a

echo ""
echo "ℹ️  Configuration:"
echo "   VITE_API_DEPLOY_URL = ${VITE_API_DEPLOY_URL}"
echo ""

# ── Build + Start ────────────────────────────────────────────────────────────
echo "[1/3] Building Docker image..."
docker compose build --no-cache

echo "[2/3] Stopping old containers (if any)..."
docker compose down --remove-orphans || true

echo "[3/3] Starting containers..."
docker compose up -d

# ── Wait + Health check ──────────────────────────────────────────────────────
echo ""
echo "⏳  Waiting for frontend to be healthy..."
sleep 5

HEALTH=$(docker inspect --format='{{.State.Health.Status}}' travello_frontend 2>/dev/null || echo "no-healthcheck")
echo "   Container health: $HEALTH"

echo ""
echo "======================================================="
echo "  ✅  Deployment complete!"
echo "   Frontend:  http://$(hostname -I | awk '{print $1}'):3000"
echo "======================================================="
