#!/bin/bash
# Run all Peakly agents in sequence
# Usage: bash tasks/agents/run-all.sh

AGENTS_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "$AGENTS_DIR/../.." && pwd)"

cd "$REPO_DIR"
mkdir -p reports/inputs reports/briefings reports/ready-to-ship

echo "Running Peakly agent team (5 roles + briefing)..."
echo ""

for agent in content-data devops product-manager revenue ux-designer; do
  echo "--- Running: $agent ---"
  claude "$(cat tasks/agents/${agent}.md)"
  echo ""
  echo "$agent complete"
  echo ""
done

echo "--- Rolling up: daily-briefing ---"
claude "$(cat tasks/agents/daily-briefing.md)"
echo "daily-briefing complete"

echo ""
echo "All agents finished. Briefing in reports/briefings/, raw inputs in reports/inputs/."
