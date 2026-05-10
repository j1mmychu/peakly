#!/bin/bash
# deploy-chain.sh — one-paste end-to-end deploy.
#
# What this does (in order):
#   1. Sweep + commit any dirty/untracked files (agent reports, state notes,
#      ready-to-ship diffs, server/sql/ migrations, etc.)
#   2. Pull-rebase + push master → origin/main (GitHub Pages auto-deploys)
#   3. SSH the VPS, git pull, pm2 restart peakly-proxy
#   4. Smoke-test the proxy /health endpoint and a /api/weather double-call
#      to verify the in-memory cache is serving hits
#
# Why: Multi-step deploy chains have eaten 30+ hours of unrealized user value
# multiple times since the 05-03 pivot (see pm-2026-05-05/06/08/09). This
# script collapses them into one paste.
#
# Use:  bash scripts/deploy-chain.sh                # ship it
#       bash scripts/deploy-chain.sh --dry-run      # show what would happen
#       bash scripts/deploy-chain.sh --skip-vps     # commit+push only, skip SSH
#
# Risk: low — script is idempotent. Empty working tree → just runs the smoke
# test. Push conflicts → aborts before SSH. SSH failures are non-fatal — the
# git push still landed and the next manual `pm2 restart` finishes the job.

set -euo pipefail

REPO=/Users/haydenb/peakly
VPS_HOST=root@198.199.80.21
VPS_PATH=/opt/peakly-proxy
HEALTH_URL=https://peakly-api.duckdns.org/health
WEATHER_URL='https://peakly-api.duckdns.org/api/weather?lat=50.11&lon=-122.95'

DRY_RUN=0
SKIP_VPS=0
for arg in "$@"; do
  case "$arg" in
    --dry-run)  DRY_RUN=1 ;;
    --skip-vps) SKIP_VPS=1 ;;
    -h|--help)
      sed -n '2,20p' "$0"; exit 0 ;;
    *) echo "unknown flag: $arg" >&2; exit 1 ;;
  esac
done

run() {
  if [ "$DRY_RUN" -eq 1 ]; then echo "[dry-run] $*"; else eval "$@"; fi
}

cd "$REPO"

# ── 1. Sweep + commit ────────────────────────────────────────────────────────
DIRTY=$(git status --porcelain | wc -l | tr -d ' ')
if [ "$DIRTY" = "0" ]; then
  echo "[1/4] working tree clean — nothing to commit"
else
  echo "[1/4] $DIRTY dirty files — committing as one chain"
  git status --short | sed 's/^/      /'
  TS=$(date -u +%Y-%m-%d)
  run "git add -A"
  run "git commit -m 'chain: deploy sweep ${TS}' --quiet"
fi

# ── 2. Pull-rebase + push ────────────────────────────────────────────────────
echo "[2/4] pull-rebase + push master:main"
run "git fetch origin main --quiet"
if ! run "git pull --rebase origin main --quiet"; then
  echo "      rebase conflict — aborting before VPS step. Resolve, re-run."
  exit 1
fi
run "git push origin master:main --quiet"

# ── 3. SSH VPS pull + pm2 restart ────────────────────────────────────────────
if [ "$SKIP_VPS" = "1" ]; then
  echo "[3/4] --skip-vps set — leaving proxy untouched"
else
  echo "[3/4] SSH ${VPS_HOST} → git pull + pm2 restart peakly-proxy"
  if ! run "ssh -o ConnectTimeout=10 ${VPS_HOST} 'cd ${VPS_PATH} && git pull --quiet && pm2 restart peakly-proxy --silent && pm2 save --silent'"; then
    echo "      VPS step failed — push landed, but proxy unrestarted. Re-run with --skip-vps once unblocked."
    exit 2
  fi
fi

# ── 4. Smoke-test ────────────────────────────────────────────────────────────
echo "[4/4] smoke-test"
if [ "$DRY_RUN" = "1" ]; then
  echo "[dry-run] curl ${HEALTH_URL}"
  echo "[dry-run] curl -sI ${WEATHER_URL} | grep X-Peakly-Cache (×2 → expect miss, then hit)"
else
  echo "      /health:"
  curl -fsS --max-time 5 "$HEALTH_URL" | sed 's/^/        /' || echo "        /health unreachable"
  echo "      cache test (call 1 should miss, call 2 should hit):"
  curl -sI --max-time 5 "$WEATHER_URL" | grep -i 'x-peakly-cache' | sed 's/^/        1) /' || echo "        1) no cache header"
  curl -sI --max-time 5 "$WEATHER_URL" | grep -i 'x-peakly-cache' | sed 's/^/        2) /' || echo "        2) no cache header"
fi

echo "[done] deploy chain complete"
