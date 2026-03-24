#!/bin/bash
# Run all Peakly agents in sequence
# Usage: bash tasks/agents/run-all.sh

AGENTS_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "$AGENTS_DIR/../.." && pwd)"

cd "$REPO_DIR"
mkdir -p reports

echo "🚀 Running Peakly agent team..."
echo ""

for agent in devops content-data product-manager growth-lead ux-designer revenue; do
  echo "━━━ Running: $agent ━━━"
  claude "$(cat tasks/agents/${agent}.md)"
  echo ""
  echo "✅ $agent complete"
  echo ""
done

echo "🏁 All agents finished. Check reports/ folder."
