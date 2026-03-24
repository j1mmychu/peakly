#!/bin/bash
set -euo pipefail

# Only run in remote (web) environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

echo "=== Peakly Session Start ==="

# 1. Show task backlog
if [ -f "$PROJECT_DIR/tasks/todo.md" ]; then
  echo ""
  echo "--- Task Backlog ---"
  cat "$PROJECT_DIR/tasks/todo.md"
else
  echo "No tasks/todo.md found."
fi

# 2. Show lessons learned
if [ -f "$PROJECT_DIR/tasks/lessons.md" ]; then
  echo ""
  echo "--- Lessons Learned ---"
  cat "$PROJECT_DIR/tasks/lessons.md"
else
  echo "No tasks/lessons.md found."
fi

# 3. Check git status for uncommitted work
echo ""
echo "--- Git Status ---"
cd "$PROJECT_DIR"
git status --short || true

echo ""
echo "=== Session Ready ==="
