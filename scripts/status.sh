#!/bin/bash
# status.sh — "all the work on one page" view of Peakly state.
# Prints: local sync state, recent ships, pending agent diffs, today's reports,
# active worktrees, plus a one-liner per uncommitted file.
#
# Run: bash scripts/status.sh
# Run continuously: watch -c -n 30 'bash /Users/haydenb/peakly/scripts/status.sh'

set -uo pipefail
cd /Users/haydenb/peakly

BOLD=$(tput bold 2>/dev/null || echo "")
DIM=$(tput dim 2>/dev/null || echo "")
GREEN=$(tput setaf 2 2>/dev/null || echo "")
YELLOW=$(tput setaf 3 2>/dev/null || echo "")
RED=$(tput setaf 1 2>/dev/null || echo "")
RESET=$(tput sgr0 2>/dev/null || echo "")

hr() { printf "${DIM}%s${RESET}\n" "──────────────────────────────────────────────────────────────"; }

echo "${BOLD}peakly · $(date '+%Y-%m-%d %H:%M %Z')${RESET}"
hr

# Local vs origin/main
git fetch origin main --quiet 2>/dev/null
LOCAL=$(git rev-parse HEAD 2>/dev/null | cut -c1-7)
REMOTE=$(git rev-parse origin/main 2>/dev/null | cut -c1-7)
BUILD=$(grep -E 'const PEAKLY_BUILD' app.jsx 2>/dev/null | sed -E 's/.*"([^"]+)".*/\1/' | head -1)
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
AHEAD=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "?")
BEHIND=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo "?")

if [ "$AHEAD" = "0" ] && [ "$BEHIND" = "0" ]; then
  STATE="${GREEN}in sync${RESET}"
elif [ "$AHEAD" != "0" ] && [ "$BEHIND" = "0" ]; then
  STATE="${YELLOW}ahead by ${AHEAD}${RESET}"
elif [ "$AHEAD" = "0" ] && [ "$BEHIND" != "0" ]; then
  STATE="${YELLOW}behind by ${BEHIND}${RESET}"
else
  STATE="${RED}diverged (+${AHEAD} / -${BEHIND})${RESET}"
fi

echo "branch        : ${BRANCH}"
echo "local         : ${LOCAL}"
echo "origin/main   : ${REMOTE}"
echo "state         : ${STATE}"
echo "build         : ${BUILD}"
echo "live          : https://j1mmychu.github.io/peakly/  (${BUILD})"

# Uncommitted
echo
echo "${BOLD}working tree${RESET}"
hr
DIRTY=$(git status --porcelain | head -20)
if [ -z "$DIRTY" ]; then
  echo "${GREEN}clean${RESET}"
else
  echo "$DIRTY" | awk '{
    flag = $1
    file = $2
    color = ""
    if (flag ~ /M/)  color = "\033[33m"
    if (flag ~ /A|\?/) color = "\033[32m"
    if (flag ~ /D/)  color = "\033[31m"
    printf "%s%-3s\033[0m %s\n", color, flag, file
  }'
fi

# Last 8 ships on origin/main
echo
echo "${BOLD}recent ships (origin/main)${RESET}"
hr
git log origin/main --oneline -8 --color=always

# Pending agent diffs
echo
echo "${BOLD}ready-to-ship diffs${RESET}"
hr
if ls reports/ready-to-ship/*.diff > /dev/null 2>&1; then
  for f in reports/ready-to-ship/*.diff; do
    echo "  $(basename "$f") · $(wc -l < "$f") lines"
  done
else
  echo "${DIM}none${RESET}"
fi

# Today's briefing
TODAY=$(date +%Y-%m-%d)
echo
echo "${BOLD}today's briefing (${TODAY})${RESET}"
hr
if [ -f "reports/briefings/${TODAY}.md" ]; then
  head -10 "reports/briefings/${TODAY}.md"
  echo "  ${DIM}…full at reports/briefings/${TODAY}.md${RESET}"
else
  echo "${DIM}no briefing yet for today${RESET}"
fi

# Today's input reports
echo
echo "${BOLD}today's agent inputs${RESET}"
hr
INPUTS=$(ls reports/inputs/*-${TODAY}.md 2>/dev/null)
if [ -n "$INPUTS" ]; then
  echo "$INPUTS" | while read f; do
    echo "  $(basename "$f")"
  done
else
  echo "${DIM}no inputs yet for today${RESET}"
fi

# Active worktree branches with their tips
echo
echo "${BOLD}active worktree branches${RESET}"
hr
N_WORKTREES=$(git worktree list | wc -l | tr -d ' ')
echo "  ${N_WORKTREES} worktrees registered"
git worktree list | grep -vE "claude/" | head -3 | awk '{printf "  %-12s %s\n", $2, $3}'
N_CLAUDE=$(git worktree list | grep -cE "claude/" || echo 0)
echo "  ${N_CLAUDE} claude/* worktrees ${DIM}(prune candidates — see scripts/prune-worktrees.sh)${RESET}"

# Auto-push log tail
echo
echo "${BOLD}auto-push tail${RESET}"
hr
if [ -f /tmp/peakly-auto-push.log ]; then
  tail -5 /tmp/peakly-auto-push.log
else
  echo "${DIM}no auto-push activity yet${RESET}"
fi

echo
hr
echo "${DIM}refresh: bash scripts/status.sh   ·   live tail: tail -f /tmp/peakly-auto-push.log   ·   v1${RESET}"
