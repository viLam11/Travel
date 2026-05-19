#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Travello — Logs Script
# Stream real-time logs from the frontend container.
# Usage: bash deploy/logs.sh [lines]
# ─────────────────────────────────────────────────────────────────────────────

LINES=${1:-100}
echo "📋  Showing last $LINES lines of travello_frontend logs (Ctrl+C to stop)..."
echo ""
docker logs travello_frontend --tail "$LINES" --follow
