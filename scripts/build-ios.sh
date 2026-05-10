#!/usr/bin/env bash
# Copies the SPA files into dist/ for Capacitor iOS bundling.
# The web product itself has no build step; this only exists so the iOS app
# bundle stays small (excludes .git, node_modules, reports, server, etc.).

set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$PWD"
DIST="$ROOT/dist"

rm -rf "$DIST"
mkdir -p "$DIST"

cp -p \
  index.html \
  app.jsx \
  sw.js \
  manifest.json \
  privacy.html \
  terms.html \
  robots.txt \
  sitemap.xml \
  "$DIST/"

echo "Built $DIST ($(du -sh "$DIST" | cut -f1))"
ls -la "$DIST"
