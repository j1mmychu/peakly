#!/bin/bash
# auto-push.sh — fires from PostToolUse hook on Edit/Write in /Users/haydenb/peakly.
# Bumps the cache key in lockstep across app.jsx + sw.js + index.html, commits any
# pending changes, then pushes master → origin/main (which is what GitHub Pages
# deploys). Idempotent: if there are no changes, exits silently.
#
# Triggered by ~/.claude/settings.json hook. Manually testable: bash scripts/auto-push.sh

set -euo pipefail

REPO=/Users/haydenb/peakly
cd "$REPO"

# Bail if not inside the peakly working tree (some other Claude session).
# Compare resolved real paths — /Users/haydenb/peakly is a symlink into
# ~/Library/Application Support/Claude/... and `git rev-parse` returns the
# real path, not the symlink.
REPO_REAL=$(cd "$REPO" && pwd -P)
GIT_TOP_REAL=$(git rev-parse --show-toplevel 2>/dev/null)
if [ "$GIT_TOP_REAL" != "$REPO_REAL" ]; then exit 0; fi

# Acquire a short lock so simultaneous Edit calls don't race.
LOCK="$REPO/.git/.auto-push.lock"
if ! mkdir "$LOCK" 2>/dev/null; then exit 0; fi
trap 'rmdir "$LOCK" 2>/dev/null || true' EXIT

# Fetch latest origin/main so we don't blindly diverge.
git fetch origin main --quiet 2>/dev/null || true

# If nothing changed in the working tree, nothing to do.
if git diff --quiet && git diff --cached --quiet && [ -z "$(git status --porcelain)" ]; then
  exit 0
fi

# Cache-key bump: only when the three load-bearing files change, and only if the
# build slug isn't already today's. Avoids endless bumps for prose-only edits.
cache_files_changed() {
  git status --porcelain | awk '{print $2}' | grep -qE '^(app\.jsx|sw\.js|index\.html)$'
}

if cache_files_changed; then
  TODAY=$(date +%Y%m%d)
  CURRENT=$(grep -E 'const PEAKLY_BUILD = "' app.jsx | head -1 | sed -E 's/.*"([^"]+)".*/\1/')
  PREFIX="${CURRENT:0:8}"
  SUFFIX="${CURRENT:8}"

  if [ "$PREFIX" != "$TODAY" ]; then
    NEW_SUFFIX="a"
  else
    # Increment one letter, a→b→...→z. Past z, wrap to "aa","ab"... (extreme)
    case "$SUFFIX" in
      "")  NEW_SUFFIX="a" ;;
      z)   NEW_SUFFIX="aa" ;;
      *z)  NEW_SUFFIX="${SUFFIX::-1}aa" ;;
      *)   LAST="${SUFFIX: -1}"
           REST="${SUFFIX::-1}"
           # next letter
           NEXT=$(printf '\\%03o' "$(($(printf '%d' "'$LAST") + 1))")
           NEW_SUFFIX="${REST}$(printf "$NEXT")" ;;
    esac
  fi
  NEW_BUILD="${TODAY}${NEW_SUFFIX}"

  # In-place edits — keep all three files locked to the same slug.
  if [ "$NEW_BUILD" != "$CURRENT" ]; then
    perl -pi -e 's/const PEAKLY_BUILD = "[^"]+"/const PEAKLY_BUILD = "'"$NEW_BUILD"'"/' app.jsx
    perl -pi -e 's/const CACHE_NAME = "peakly-[^"]+"/const CACHE_NAME = "peakly-'"$NEW_BUILD"'"/' sw.js
    perl -pi -e 's/app\.jsx\?v=[^"]+/app.jsx?v='"$NEW_BUILD"'/' index.html
  fi
fi

# Compose a commit message from the touched files.
CHANGED=$(git status --porcelain | awk '{print $2}' | head -6 | tr '\n' ' ')
if [ -z "$CHANGED" ]; then exit 0; fi
SHORT=$(echo "$CHANGED" | sed 's/  */, /g; s/, $//')

git add -A
# Skip if the only change ended up being whitespace / nothing real
if git diff --cached --quiet; then exit 0; fi

git commit -m "auto: ${SHORT}" --quiet || exit 0

# Pull-rebase any concurrent commits before pushing. If conflicts, abort the
# push and leave the commit local — the next edit will retry, and visible
# `git status` will reveal it.
if ! git pull --rebase origin main --quiet 2>>/tmp/peakly-auto-push.log; then
  echo "[auto-push] rebase conflict — manual merge needed (commit kept local)" >&2
  git rebase --abort 2>/dev/null || true
  exit 0
fi

git push origin master:main --quiet 2>>/tmp/peakly-auto-push.log || {
  echo "[auto-push] push failed — see /tmp/peakly-auto-push.log" >&2
  exit 0
}

echo "[auto-push] shipped: ${SHORT}"
