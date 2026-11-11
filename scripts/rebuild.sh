#!/usr/bin/env bash
# Rebuild the Astro site on the Ubuntu VM after a Sanity webhook.
# Set REBUILD_COMMAND to the absolute path of this script.
set -euo pipefail

ROOT="${JSONE_ROOT:-/var/www/jsone}"
LOG_DIR="${JSONE_LOG_DIR:-/var/log/jsone}"
mkdir -p "$LOG_DIR"
LOG="$LOG_DIR/rebuild.log"

exec >>"$LOG" 2>&1
echo "==== $(date -Is) rebuild start ===="

cd "$ROOT"
git pull --ff-only
npm ci
npm run build -w web

# Restart Node server so it picks up new static files (optional if you only
# point Nginx at web/dist and the server only handles /api).
if systemctl is-active --quiet jsone-web; then
  sudo systemctl reload-or-restart jsone-web
fi

echo "==== $(date -Is) rebuild done ===="
