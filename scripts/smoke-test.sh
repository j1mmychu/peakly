#!/usr/bin/env bash
# Smoke test entrypoint. Default mode hits the live URL; --local serves dist/.
# Exit 0 = pass, 1 = fail.
#
# Usage:
#   bash scripts/smoke-test.sh                    # live (j1mmychu.github.io/peakly)
#   bash scripts/smoke-test.sh https://other-url  # custom URL
#   bash scripts/smoke-test.sh --local            # serve dist/ on :8002

set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO"

# Make node + npx available even when invoked from a non-interactive context
# (e.g. PostToolUse hook). Mirrors the install at ~/.local/node/.
export PATH="$HOME/.local/bin:$PATH"

URL="https://j1mmychu.github.io/peakly/"
LOCAL_MODE=0

if [ "${1:-}" = "--local" ]; then
  LOCAL_MODE=1
  URL="http://localhost:8002/"
elif [ -n "${1:-}" ]; then
  URL="$1"
fi

if [ "$LOCAL_MODE" = "1" ]; then
  if [ ! -d "dist" ]; then bash "$REPO/scripts/build-ios.sh" >/dev/null; fi
  ( cd dist && python3 -m http.server 8002 >/dev/null 2>&1 ) &
  SERVER_PID=$!
  trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT
  # tiny wait for server up
  for _ in 1 2 3 4 5; do
    if curl -s -o /dev/null --max-time 1 "$URL"; then break; fi
    sleep 0.3
  done
fi

node "$REPO/scripts/smoke-test.mjs" "$URL"
