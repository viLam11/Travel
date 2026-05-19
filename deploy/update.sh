#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Travello — Update Script
# Pull latest code from Git and rebuild + restart the frontend container.
# Run from the project root: bash deploy/update.sh
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "======================================================="
echo "  Travello — Pulling Updates"
echo "======================================================="

# ── Git pull ─────────────────────────────────────────────────────────────────
if [ -d ".git" ]; then
  echo "[1/3] Pulling latest code..."
  git pull origin main
else
  echo "[1/3] Not a git repo — skipping pull."
fi

# ── Rebuild + Restart ────────────────────────────────────────────────────────
echo "[2/3] Rebuilding Docker image..."
docker compose build --no-cache

echo "[3/3] Restarting container..."
docker compose up -d

sleep 3
echo ""
echo "📋  Container status:"
docker compose ps

echo ""
echo "✅  Update complete!"
