#!/usr/bin/env bash
# Build the self-contained iOS web bundle in dist/ for Capacitor.
#
# Per App Store guideline 2.5.2, the iOS app must function without network
# access — no remote <script>/<link>, no Babel runtime on device. This script
# delegates to scripts/build-ios.mjs which:
#   1. Pre-transpiles app.jsx → dist/app.js (@babel/standalone, react preset)
#   2. Vendors React, ReactDOM, Supabase, Leaflet (css+js) into dist/vendor/
#   3. Rewrites dist/index.html to reference only local files
#   4. Greps dist/ to fail loud if any CDN ref slipped through
#
# Web product is unchanged — runtime-Babel setup at the repo root still drives
# GitHub Pages. This is iOS-bundle-only.

set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$PWD"

if [ ! -d "$ROOT/node_modules/@babel/standalone" ]; then
  echo "[build-ios] @babel/standalone missing — running npm install"
  npm install --no-audit --no-fund
fi

node "$ROOT/scripts/build-ios.mjs"
