#!/usr/bin/env bash
# Rebuild the Astro site on the Ubuntu VM after a Sanity webhook.
# Set REBUILD_COMMAND to the absolute path of this script (no shell metacharacters).
#
# Run as the same user that owns /var/www/jsone (see deploy/jsone-web.service).
# Do not use sudo here — Node runs with NoNewPrivileges.
set -euo pipefail

ROOT="${JSONE_ROOT:-/var/www/jsone}"
LOG_DIR="${JSONE_LOG_DIR:-/var/log/jsone}"
mkdir -p "$LOG_DIR"
LOG="${JSONE_REBUILD_LOG:-$LOG_DIR/rebuild.log}"
LOCK="${JSONE_REBUILD_LOCK:-$LOG_DIR/rebuild.lock}"

# Serialize overlapping webhook rebuilds (Node also debounces).
exec 9>"$LOCK"
if ! flock -n 9; then
  echo "==== $(date -Is) rebuild skipped (lock held) ====" >>"$LOG"
  exit 0
fi

exec >>"$LOG" 2>&1
echo "==== $(date -Is) rebuild start ===="

cd "$ROOT"
git pull --ff-only
npm ci
npm run build -w web
# API bundle changes rarely; rebuild server when sources change
npm run build -w server

# Option A (Nginx serves web/dist): no process restart required for HTML/CSS/JS.
# Optional restart if you proxy everything through Node or changed server code:
# Set JSONE_RESTART_CMD to a root-owned helper, e.g. /usr/local/bin/jsone-restart
# (see deploy/jsone-restart.example) — never sudo from this script under NoNewPrivileges.
if [[ -n "${JSONE_RESTART_CMD:-}" ]]; then
  echo "restart via JSONE_RESTART_CMD"
  # Intentional: command path must be a single absolute executable configured by ops.
  "$JSONE_RESTART_CMD"
elif systemctl --user is-active --quiet jsone-web 2>/dev/null; then
  systemctl --user reload-or-restart jsone-web
else
  echo "skip restart (Nginx static Option A, or set JSONE_RESTART_CMD)"
fi

echo "==== $(date -Is) rebuild done ===="
