#!/bin/bash
# auto-push.sh — fires from PostToolUse hook on Edit/Write in /Users/haydenb/peakly.
# Bumps the cache key in lockstep across app.jsx + sw.js + index.html, commits any
# pending changes, then pushes master → origin/main (which is what GitHub Pages
# deploys). Idempotent: if there are no changes, exits silently.
#
# Triggered by ~/.claude/settings.json hook. Manually testable: bash scripts/auto-push.sh

set -euo pipefail

# Pause switch: `touch /tmp/peakly-pause-autopush` to suspend auto-push during a
# multi-edit change so half-finished work never ships to prod; `rm` it to resume.
if [ -f /tmp/peakly-pause-autopush ]; then exit 0; fi

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
  SLEN=${#SUFFIX}

  # Only reset to "a" when the current stamp is from a PRIOR day. Same-day or
  # future-day stamps (e.g. manually bumped past midnight UTC) increment
  # forward — never regress to a smaller suffix on the same day.
  NEW_BUILD=""
  if [ -z "$CURRENT" ] || [ "$PREFIX" \< "$TODAY" ]; then
    NEW_BUILD="${TODAY}a"
  else
    # Increment last char of SUFFIX (a→b→...→z, then z→aa, dz→daa, etc.).
    # Use bash-3-compatible substring forms — ${var: -1} and ${var::-1} fail
    # silently on macOS's default bash 3.2.
    if [ -z "$SUFFIX" ]; then
      NEW_SUFFIX="a"
    else
      LAST="${SUFFIX:$((SLEN-1)):1}"
      REST="${SUFFIX:0:$((SLEN-1))}"
      if [ "$LAST" = "z" ]; then
        NEW_SUFFIX="${REST}aa"   # wrap: ...z → ...aa
      else
        NEXT_CODE=$(($(printf '%d' "'$LAST") + 1))
        NEXT_CHAR=$(printf "\\$(printf '%03o' "$NEXT_CODE")")
        NEW_SUFFIX="${REST}${NEXT_CHAR}"
      fi
    fi
    NEW_BUILD="${PREFIX}${NEW_SUFFIX}"
  fi

  # In-place edits — keep all three files locked to the same slug.
  if [ "$NEW_BUILD" != "$CURRENT" ]; then
    perl -pi -e 's/const PEAKLY_BUILD = "[^"]+"/const PEAKLY_BUILD = "'"$NEW_BUILD"'"/' app.jsx
    perl -pi -e 's/const CACHE_NAME = "peakly-[^"]+"/const CACHE_NAME = "peakly-'"$NEW_BUILD"'"/' sw.js
    perl -pi -e 's/app\.jsx\?v=[^"]+/app.jsx?v='"$NEW_BUILD"'/' index.html
  fi
fi

# ─── Invariant guard (CLAUDE.md Open #14) ───────────────────────────────────
# Refuse to commit app.jsx if structural invariants regress. This is the
# defense against the GEAR_ITEMS class of bug: clean-looking commits that
# silently delete logic. Fails loud, keeps changes in the working tree so
# nothing is lost — just not shipped.
guard_fail() {
  echo "[auto-push] ❌ INVARIANT GUARD: $1 — COMMIT REFUSED, changes left in working tree" | tee -a /tmp/peakly-auto-push.log >&2
  exit 0
}

if git status --porcelain | awk '{print $2}' | grep -q '^app\.jsx$'; then
  # 1. Brace balance
  OPEN=$(grep -o '{' app.jsx | wc -l | tr -d ' ')
  CLOSE=$(grep -o '}' app.jsx | wc -l | tr -d ' ')
  [ "$OPEN" = "$CLOSE" ] || guard_fail "brace imbalance ($OPEN open / $CLOSE close)"

  # 2. Cache stamp lockstep across all three load-bearing files
  S_APP=$(grep -E 'const PEAKLY_BUILD = "' app.jsx | head -1 | sed -E 's/.*"([^"]+)".*/\1/')
  S_SW=$(grep -E 'const CACHE_NAME = "peakly-' sw.js | head -1 | sed -E 's/.*peakly-([^"]+)".*/\1/')
  S_IDX=$(grep -oE 'app\.jsx\?v=[a-z0-9]+' index.html | head -1 | sed 's/.*v=//')
  { [ -n "$S_APP" ] && [ "$S_APP" = "$S_SW" ] && [ "$S_APP" = "$S_IDX" ]; } \
    || guard_fail "cache stamp drift (app=$S_APP sw=$S_SW idx=$S_IDX)"

  # 3. Venue count can't crater. Baseline persisted in scripts/.venue-baseline;
  # grows automatically, but a drop of >5 in one commit means something ate the
  # VENUES array. Legit big deletions: update the baseline file by hand first.
  # Count via eval of the VENUES array (same walker as status.sh) — NEVER grep
  # category:, it's blind to the ~197 JSON-formatted batch entries (sees 156
  # of 353). Falls back to the old grep only if node is unavailable/errors,
  # so the guard can never block a commit on counter failure.
  VCOUNT=$(node -e '
const fs=require("fs");const s=fs.readFileSync("app.jsx","utf8");
const m=s.match(/const\s+VENUES\s*=\s*\[/);if(!m){process.exit(1);}
let i=m.index+m[0].length-1,d=0,start=i;
while(i<s.length){const c=s[i];if(c==="[")d++;else if(c==="]"){d--;if(d===0){i++;break;}}else if(c==="\""||c==="'"'"'"||c==="`"){const q=c;i++;while(i<s.length&&s[i]!==q){if(s[i]==="\\")i++;i++;}}i++;}
const a=eval("("+s.slice(start,i)+")");console.log(a.length);
' 2>/dev/null)
  case "$VCOUNT" in
    ''|*[!0-9]*) VCOUNT=$(grep -cE 'category: *"(skiing|beach)"' app.jsx) ;;
  esac
  BASEFILE="$REPO/scripts/.venue-baseline"
  BASELINE=$(cat "$BASEFILE" 2>/dev/null || echo 0)
  if [ "$VCOUNT" -lt $((BASELINE - 5)) ]; then
    guard_fail "venue count dropped $BASELINE → $VCOUNT (limit: -5/commit)"
  fi
  [ "$VCOUNT" -gt "$BASELINE" ] && echo "$VCOUNT" > "$BASEFILE"
fi
# ─────────────────────────────────────────────────────────────────────────────

# Compose a commit message from the touched files.
CHANGED=$(git status --porcelain | awk '{print $2}' | head -6 | tr '\n' ' ')
if [ -z "$CHANGED" ]; then exit 0; fi
SHORT=$(echo "$CHANGED" | sed 's/  */, /g; s/, $//')

git add -A
# Skip if the only change ended up being whitespace / nothing real
if git diff --cached --quiet; then exit 0; fi

# Paper trail for logic-bearing commits: app.jsx commits carry a diffstat body
# so `git log` shows the blast radius instead of a bare "auto: app.jsx".
if echo "$CHANGED" | grep -q 'app.jsx'; then
  STAT=$(git diff --cached --stat -- app.jsx | tail -1 | sed 's/^ *//')
  git commit -m "auto: ${SHORT}" -m "app.jsx: ${STAT}" --quiet || exit 0
else
  git commit -m "auto: ${SHORT}" --quiet || exit 0
fi

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

# Post-deploy smoke test: only when runtime files (app.jsx/sw.js/index.html)
# were in the just-pushed commit AND playwright is installed. Sleep ~25s for
# GitHub Pages CDN to update, then run headless boot check against the live
# URL. Fails loud but non-fatal — the commit/push already happened.
LAST_COMMIT_FILES=$(git diff-tree --no-commit-id --name-only -r HEAD 2>/dev/null)
if echo "$LAST_COMMIT_FILES" | grep -qE '^(app\.jsx|sw\.js|index\.html)$' \
   && [ -f "$REPO/node_modules/playwright/package.json" ]; then
  ( sleep 25
    if ! bash "$REPO/scripts/smoke-test.sh" >>/tmp/peakly-smoke.log 2>&1; then
      echo "[auto-push] ❌ DEPLOY SMOKE FAILED — site may be broken — see /tmp/peakly-smoke.log" >&2
    fi
  ) &
  disown
fi
