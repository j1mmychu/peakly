#!/usr/bin/env bash
# Wires APNS env vars into the existing pm2 ecosystem and restarts the proxy.
# Run AFTER you've scp'd your .p8 key to /etc/peakly/ on the VPS.
# Prompts for Key ID, Team ID, and the .p8 filename. Bundle ID defaults to com.peakly.app.

set -euo pipefail

PROXY_DIR="/opt/peakly-proxy"
ECO_FILE="$PROXY_DIR/ecosystem.config.js"
KEY_DIR="/etc/peakly"

if [ ! -f "$ECO_FILE" ]; then
  echo "ERROR: $ECO_FILE not found. Run setup-token.sh first."
  exit 1
fi

mkdir -p "$KEY_DIR"

echo "Available .p8 keys in $KEY_DIR:"
ls "$KEY_DIR"/AuthKey_*.p8 2>/dev/null || { echo "  (none — scp your AuthKey_<KEYID>.p8 here first)"; exit 1; }
echo

read -p "Enter the .p8 filename (e.g. AuthKey_ABC123XYZ.p8): " P8_FILE
if [ ! -f "$KEY_DIR/$P8_FILE" ]; then
  echo "ERROR: $KEY_DIR/$P8_FILE not found."
  exit 1
fi
chmod 600 "$KEY_DIR/$P8_FILE"

# Auto-extract Key ID from filename if it looks right (AuthKey_<KEYID>.p8)
DEFAULT_KEY_ID=$(echo "$P8_FILE" | sed -nE 's/^AuthKey_([A-Z0-9]{10})\.p8$/\1/p')
read -p "APNs Key ID${DEFAULT_KEY_ID:+ [$DEFAULT_KEY_ID]}: " APNS_KEY_ID
APNS_KEY_ID="${APNS_KEY_ID:-$DEFAULT_KEY_ID}"
if [ ${#APNS_KEY_ID} -ne 10 ]; then
  echo "ERROR: Key ID should be exactly 10 chars."
  exit 1
fi

read -p "Apple Team ID (10 chars, from developer.apple.com → Membership): " APNS_TEAM_ID
if [ ${#APNS_TEAM_ID} -ne 10 ]; then
  echo "ERROR: Team ID should be exactly 10 chars."
  exit 1
fi

read -p "Bundle ID [com.peakly.app]: " APNS_BUNDLE_ID
APNS_BUNDLE_ID="${APNS_BUNDLE_ID:-com.peakly.app}"

read -p "Production APNs (y/N — N for sandbox/dev builds): " APNS_PROD_INPUT
APNS_PROD="false"
[[ "$APNS_PROD_INPUT" =~ ^[Yy]$ ]] && APNS_PROD="true"

# Patch the ecosystem.config.js by re-emitting it with merged env. Reads existing
# TRAVELPAYOUTS_TOKEN value via node so we don't re-prompt for it.
NEW_CONFIG=$(node -e "
  const cfg = require('$ECO_FILE');
  cfg.apps[0].env = Object.assign({}, cfg.apps[0].env, {
    APNS_KEY_ID: '$APNS_KEY_ID',
    APNS_TEAM_ID: '$APNS_TEAM_ID',
    APNS_BUNDLE_ID: '$APNS_BUNDLE_ID',
    APNS_KEY_PATH: '$KEY_DIR/$P8_FILE',
    APNS_PROD: '$APNS_PROD',
  });
  console.log('module.exports = ' + JSON.stringify(cfg, null, 2) + ';');
")

echo "$NEW_CONFIG" > "$ECO_FILE"
chmod 600 "$ECO_FILE"
echo "Updated $ECO_FILE"

pm2 restart peakly-proxy --update-env
pm2 save
sleep 2

echo
echo "=== /health ==="
curl -s --max-time 5 http://localhost:3001/health | python3 -m json.tool 2>&1 | head -20
echo
echo "Look for 'apns': 'configured' above. If you see 'unconfigured', check pm2 logs."
