#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Travello — Restart Script
# Restart the frontend container without rebuilding the image.
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🔄  Restarting Travello frontend container..."
docker compose restart frontend

sleep 2
docker compose ps

echo "✅  Restart complete!"
